import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	enableFeature: boolean;
	selectedOption: string;
	userCommandCode: string; // New setting for storing the user's code
	dynamicSettings: string[];  // New property to store dynamic settings
    quotes: string[];
	codes: string[];
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	enableFeature: false,
	selectedOption: 'option1',
    userCommandCode: '', // Default to empty string
	dynamicSettings: [],        // Initialize as an empty array
	quotes: [],
	codes: [],
}

export default class NoodlyCommandsPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		//Loading a function used after //CAREFUL
		// Example of registering the user command on load if it exists
		this.registerUserCommand();


		//test3
		this.addCommand({
			id: 'testnum3',
			name: 'Testnum3',
			// callback: () => { new SampleModal(this.app).open(); } //BUG, I tried using this and this function is not bing used.
			callback: () => {
				// This is where you execute the user's code
				const userFunction = new Function(this.settings.userCommandCode);
				try {
					userFunction(); // Run the user's code
				} catch (error) {
					new Notice('Error in your code: ' + error.message);
				}
			}
		});



		// NEW
		this.addCommand({
			id: 'testehere',
			name: 'Test here.',
			callback: () => {
				console.log("Hey, you!");
			}
		});

		
		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});


		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));


	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	
	registerUserCommand() { //NEW THIS DOES WORK IN EDITOR MODE
		const userFunction = new Function(this.settings.userCommandCode);
			
		// TODO UNCOMMENT THIS!
		// NEW VERSION (tthis is meant to not be editor dependent)
		this.addCommand({
			id: 'user-custom-command',
			name: 'User Custom Command',
			// callback: () => { new SampleModal(this.app).open(); } //BUG, I tried using this and this function is not bing used.
			callback: () => {
				// This is where you execute the user's code
				const userFunction = new Function(this.settings.userCommandCode);
				try {
					userFunction(); // Run the user's code
				} catch (error) {
					new Notice('Error in your code: ' + error.message);
				}
			}
		});

		new Notice('Custom command registered successfully.');
	}
}


class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}


class SampleSettingTab extends PluginSettingTab {
	plugin: NoodlyCommandsPlugin;
	settingsArray: Setting[] = []; // Array to track settings

	constructor(app: App, plugin: NoodlyCommandsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}




	//VIP START OF DISPLAYYYYYY /////////////////////////////
	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		//VAR DISPLAY->TEXTBOX
		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}))
		;

		//VAR DISPLAY->TOOGLE
		// New Setting #2 (e.g., a toggle switch)
		new Setting(containerEl)
			.setName('Enable Feature')
			.setDesc('Toggle this to enable or disable a feature')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableFeature)
				.onChange(async (value) => {
					this.plugin.settings.enableFeature = value;
					await this.plugin.saveSettings();
		}));

		//VAR DISPLAY->DROPDOWN
		// New Setting #3 (e.g., a dropdown menu)
		new Setting(containerEl)
			.setName('Select an Option')
			.setDesc('Choose an option from the dropdown')
			.addDropdown(dropdown => dropdown
				.addOption('option1', 'Option 1')
				.addOption('option2', 'Option 2')
				.setValue(this.plugin.settings.selectedOption)
				.onChange(async (value) => {
					this.plugin.settings.selectedOption = value;
					await this.plugin.saveSettings();
		}));

		//VAR DISPLAY->TEXTAREA
		new Setting(containerEl)
			.setName('Custom Command Code')
			.setDesc('Enter the code to be executed when the custom command is triggered.')
			.addTextArea(textArea => textArea
				.setPlaceholder('Enter your code here')
				.setValue(this.plugin.settings.userCommandCode)
				.onChange(async (value) => {
					this.plugin.settings.userCommandCode = value;
					await this.plugin.saveSettings();
		}));

		//VAR DISPLAY->BUTTON_TO_MAKE_COMMAND
		new Setting(containerEl)
			.setName('Register Custom Command')
			.setDesc('Click to register a new command with the code you provided.')
			.addButton(button => button
				.setButtonText('Register Command')
				.onClick(async () => {
					this.plugin.registerUserCommand();
			}));
		

		//VIP
		//VAR DISPLAY->BUTTON++_TO_MAKE_COMMAND
		//IDEA USEFUL BUTTON++!!
		new Setting(containerEl)
			.setName('Register Custom Command')
			.setDesc('Click to register a new command with the code you provided.')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}))
			.addTextArea(textArea => textArea
				.setPlaceholder('Enter your code here')
				.setValue(this.plugin.settings.userCommandCode)
				.onChange(async (value) => {
					this.plugin.settings.userCommandCode = value;
					await this.plugin.saveSettings();
				}))
			.addButton(button => button
					.setButtonText('Register Command')
					.onClick(async () => {
						this.plugin.registerUserCommand();
				}));
		;


		//VAR DISPLAY->STUFF
		// tricky ones
		const setting = new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				})
			)
			.addButton(button => button
				.setButtonText('Remove')
				.setCta() // Optional, makes the button more prominent
				.onClick(() => {
					// Remove only this setting
					setting.settingEl.remove();
				})
		);


		//OLD ER STILL
		//VAR DISPLAY->STUFF
		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				})
			)
		;


		// h2
		//VAR DISPLAY->HEADER
		//IDEA DISPLAY->HEADER
        containerEl.createEl('h2', { text: 'Your Popular Quotes' });



		//VAR DISPLAY->
		// OLD ER STILL MODIFIED
		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				})
			)
			.addButton(button => button
				.setButtonText('Remove')
				.setCta() // Optional, makes the button more prominent
				.onClick(() => {
					// Remove the setting element from the DOM
					containerEl.empty();
				})
			);



		// NEW NEW
		//VAR DISPLAY->
		// Button to add a new settings entry
		new Setting(containerEl)
			.addButton(button => {
				button
					.setButtonText("Add New Setting")
					.setCta()
					.onClick(() => {
						this.addNewSetting(containerEl);
					});
		});

		//VAR DISPLAY->
		// Button to remove the last settings entry
		new Setting(containerEl)
			.addButton(button => {
				button
					.setButtonText("Remove Last Setting")
					.setWarning() // Optional: makes the button red for warning
					.onClick(() => {
						this.removeLastSetting();
					});
		});






		//VIP                                                       
		//VAR DISPLAY-> HEADER
        containerEl.createEl('h2', { text: 'Your experiments' });
		// OLD STYLE, NEW VERSION for full fucntinaltiy
		// more settings experiments
        this.plugin.settings.quotes.forEach((quote, index) => {    // Safely get the corresponding code (handle cases where codes might not be defined)
			const code = this.plugin.settings.codes && this.plugin.settings.codes[index] ? this.plugin.settings.codes[index] : '';
			//OLD const code = this.plugin.settings.codes;
            const setting = new Setting(containerEl)
                .setName(`Quote #${index + 1}`)
                .setDesc('Enter your favorite quote')
                .addText(text => text
                    .setPlaceholder('Enter your quote')
                    .setValue(quote)
                    .onChange(async (value) => {
                        this.plugin.settings.quotes[index] = value;
                        await this.plugin.saveSettings();
                    })
                )
				.addTextArea(textArea => textArea
					.setPlaceholder('Enter your code here')
					.setValue(code)
					.onChange(async (value) => {
                        this.plugin.settings.codes[index] = value;
						await this.plugin.saveSettings();
					}))
                .addButton(button => button
                    .setButtonText('Remove')
                    .setCta() // Optional, makes the button more prominent
                    .onClick(async () => {
                        // Remove the quote from the array and save the settings
                        this.plugin.settings.quotes.splice(index, 1);
                        this.plugin.settings.codes.splice(index, 1);
                        await this.plugin.saveSettings();
                        // Re-render the settings UI
                        this.display();
                    })
                );
        });
        new Setting(containerEl)
            .addButton(button => button
                .setButtonText('Add New Quote')
                .setCta()
                .onClick(async () => {
                    this.plugin.settings.quotes.push(''); // Add an empty entry
                    this.plugin.settings.codes.push(''); //CAREFUL 
                    await this.plugin.saveSettings();
                    this.display(); // Re-render the settings UI to show the new entry
                })
		);
		




		//VIP                                                       
		// // OLD, This is the old way of doing it.
		// //VAR DISPLAY-> HEADER
        // containerEl.createEl('h2', { text: 'Your experiments' });
        // this.plugin.settings.quotes.forEach((quote, index) => {
        //     const setting = new Setting(containerEl)
        //         .setName(`Quote #${index + 1}`)
        //         .setDesc('Enter your favorite quote')
        //         .addText(text => text
        //             .setPlaceholder('Enter your quote')
        //             .setValue(quote)
        //             .onChange(async (value) => {
        //                 this.plugin.settings.quotes[index] = value;
        //                 await this.plugin.saveSettings();
        //             })
        //         )
        //         .addButton(button => button
        //             .setButtonText('Remove')
        //             .setCta() // Optional, makes the button more prominent
        //             .onClick(async () => {
        //                 // Remove the quote from the array and save the settings
        //                 this.plugin.settings.quotes.splice(index, 1);
        //                 await this.plugin.saveSettings();
        //                 // Re-render the settings UI
        //                 this.display();
        //             })
        //         );
        // });
		// //NEW 
		// // //VAR DISPLAY->BUTTON_TO_ADD_SETTING
        // // Add a button to create a new quote entry
        // new Setting(containerEl)
        //     .addButton(button => button
        //         .setButtonText('Add New Quote')
        //         .setCta()
        //         .onClick(async () => {
        //             this.plugin.settings.quotes.push(''); // Add an empty entry
        //             // this.plugin.settings.codes.push(''); //dont use this, just for clarity
        //             await this.plugin.saveSettings();
        //             this.display(); // Re-render the settings UI to show the new entry
        //         })
		// );


	}
	// VIP !END! OF DISPLAY


	//VIP 
	//VAR-Function that adds new settings
	//OLD ER STILL
	// Function to add a new setting entry
	addNewSetting(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				})
			)
		;
	}






}//VIP TRUE END ____________________________________________________































/*

//latest, delet or wahatever


	
	// //NEW
	//VAR-Function that adds new settings
	// Utility function to create a Setting with the desired behavior
	// createQuoteSetting = (containerEl: HTMLElement, quote: string, index: number) => {
	// 	//AUX I think this here is just for guidance// new Setting(containerEl)
	// 	// 	.addTextArea(textArea => textArea
	// 	// 		.setPlaceholder('Enter your code here')
	// 	// 		.setValue(this.plugin.settings.userCommandCode)
	// 	// 		.onChange(async (value) => {
	// 	// 			this.plugin.settings.userCommandCode = value;
	// 	// 			await this.plugin.saveSettings();
	// 	// 		}))
	// 	// 	.addButton(button => button
	// 	// 			.setButtonText('Register Command')
	// 	// 			.onClick(async () => {
	// 	// 				this.plugin.registerUserCommand();
	// 	// 		}));
	// 	// ;
	// 	return new Setting(containerEl)
	// 		.setName(`Quote #${index + 1}`)
	// 		.setDesc('Enter your favorite quote')
	// 		.addTextArea(textArea => textArea
	// 			.setPlaceholder('Enter your code here')
	// 			//OLD- .setValue(this.plugin.settings.userCommandCode)
	// 			.setValue(code)
	// 			.onChange(async (value) => {
	// 				this.plugin.settings.codes[index] = value;
	// 				await this.plugin.saveSettings();
	// 		}))
	// 		.addText(text => text
	// 			.setPlaceholder('Enter your quote')
	// 			.setValue(quote)
	// 			.onChange(async (value) => {
	// 				this.plugin.settings.quotes[index] = value;
	// 				await this.plugin.saveSettings();
	// 			})
	// 		)
	// 		.addButton(button => button
	// 			.setButtonText('Remove')
	// 			.setCta()
	// 			.onClick(async () => {
	// 				this.plugin.settings.quotes.splice(index, 1);
	// 				await this.plugin.saveSettings();
	// 				// Re-render the settings UI
	// 				this.display();
	// 			})
	// 		);
	// };

	// //VAR
	// // Place the createQuoteSetting method here
	// createQuoteSetting(containerEl: HTMLElement, index: number, quote: string) {
	// 	const setting = new Setting(containerEl)
	// 		.setName(`Quote #${index + 1}`)
	// 		.setDesc('Enter your favorite quote')
	// 		.addText(text => text
	// 			.setPlaceholder('Enter your quote')
	// 			.setValue(quote)
	// 			.onChange(async (value) => {
	// 				this.plugin.settings.quotes[index] = value;
	// 				await this.plugin.saveSettings();
	// 			})
	// 		)
	// 		.addButton(button => button
	// 			.setButtonText('Remove')
	// 			.setCta()
	// 			.onClick(async () => {
	// 				this.plugin.settings.quotes.splice(index, 1);
	// 				await this.plugin.saveSettings();
	// 				this.display(); // Re-render the settings UI
	// 			})
	// 		);
	// }
	// //OLD
	// //VAR-Function that adds new settings
	// // Utility function to create a Setting with the desired behavior
	// const createQuoteSetting = (containerEl: HTMLElement, quote: string, index: number) => {
	// 	return new Setting(containerEl)
	// 		.setName(`Quote #${index + 1}`)
	// 		.setDesc('Enter your favorite quote')
	// 		.addText(text => text
	// 			.setPlaceholder('Enter your quote')
	// 			.setValue(quote)
	// 			.onChange(async (value) => {
	// 				this.plugin.settings.quotes[index] = value;
	// 				await this.plugin.saveSettings();
	// 			})
	// 		)
	// 		.addButton(button => button
	// 			.setButtonText('Remove')
	// 			.setCta()
	// 			.onClick(async () => {
	// 				this.plugin.settings.quotes.splice(index, 1);
	// 				await this.plugin.saveSettings();
	// 				// Re-render the settings UI
	// 				this.display();
	// 			})
	// 		);
	// };


	// //FIX
	// // Place the createQuoteSetting method here
	// createQuoteSetting(containerEl: HTMLElement, index: number, quote: string) {
	// 	const setting = new Setting(containerEl)
	// 		.setName(`Quote #${index + 1}`)
	// 		.setDesc('Enter your favorite quote')
	// 		.addText(text => text
	// 			.setPlaceholder('Enter your quote')
	// 			.setValue(quote)
	// 			.onChange(async (value) => {
	// 				this.plugin.settings.quotes[index] = value;
	// 				await this.plugin.saveSettings();
	// 			})
	// 		)
	// 		.addButton(button => button
	// 			.setButtonText('Remove')
	// 			.setCta()
	// 			.onClick(async () => {
	// 				this.plugin.settings.quotes.splice(index, 1);
	// 				await this.plugin.saveSettings();
	// 				this.display(); // Re-render the settings UI
	// 			})
	// 		);
	// }



	// // //FIX BEFORE IT WAS //function and it didnt work wtf
	// createQuoteSetting(containerEl: HTMLElement, plugin: YourPluginClass, index: number, quote: string): Setting {
	// 	return new Setting(containerEl)
	// 		.setName(`Quote #${index + 1}`)
	// 		.setDesc('Enter your favorite quote')
	// 		.addText(text => text
	// 			.setPlaceholder('Enter your quote')
	// 			.setValue(quote)
	// 			.onChange(async (value) => {
	// 				plugin.settings.quotes[index] = value;
	// 				await plugin.saveSettings();
	// 			})
	// 		)
	// 		.addButton(button => button
	// 			.setButtonText('Remove')
	// 			.setCta()
	// 			.onClick(async () => {
	// 				// Remove the quote from the array and save the settings
	// 				plugin.settings.quotes.splice(index, 1);
	// 				await plugin.saveSettings();
	// 				// Re-render the settings UI
	// 				plugin.display();
	// 			})
	// 		);
	// }

	







*/






/* USEFUL!!


		// UNNECESSARY
		// // This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice('This is a notice!');
		// });
		// // Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// UNNECESSARY
		// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// // BASICALY THIS DEFINES A LISTENER. OR OFTEN CAN ANYWAY.
		// // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// // Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));



*/


/*

1. Inspect the Command Registration in Obsidian:
After registering both commands, check Obsidian’s Command Palette. Are both commands listed identically, or does one have additional metadata (like being restricted to the editor)?
2. Explicitly Define Command Properties:
If Obsidian is automatically inferring that the first command is editor-dependent, you can try explicitly defining the editorCallback as null or leaving it undefined:

this.addCommand({
    id: 'user-custom-command',
    name: 'User Custom Command',
    callback: () => {
        try {
            const userFunction = new Function(this.settings.userCommandCode);
            userFunction(); // Run the user's code
        } catch (error) {
            new Notice('Error in your code: ' + error.message);
        }
    },
    editorCallback: undefined, // Explicitly tell Obsidian there's no editor context
});

3. Check for Global vs. Editor Command Types:
Obsidian may treat commands differently based on their context. By default, a command registered with only callback should be treated as global (non-editor specific), while those registered with editorCallback are editor-specific.
If the function creation within the callback is somehow affecting how Obsidian interprets the command, this could lead to the observed behavior.

The most likely cause of the issue is related to function scoping and how Obsidian interprets commands. By defining the function outside the callback (as in registerUserCommand_v2), you help Obsidian treat it as a globally accessible command that doesn’t rely on the editor.

If you want to dig deeper, you can test the impact of moving the function definition in and out of the callback and explicitly define properties like editorCallback. This should give you more control over how Obsidian interprets your commands.




		// // OLD BUTTON
		// // Button to add new settings entry
		// new Setting(containerEl)
		// 	.addButton(button => { button
		// 			.setButtonText("Add New Setting")
		// 			.setCta()  // Optional: makes the button look more prominent
		// 			.onClick(() => {
		// 				this.addNewSetting(containerEl);
		// 				})
		// 			;
		// 		})
		// 	;


		// NEW attempts
		// // Button to add a new settings entry
		// new Setting(containerEl)
		// 	.addButton(button => {
		// 		button
		// 		.setButtonText("Add New Setting")
		// 		.setCta()
		// 		.onClick(() => {
		// 			this.addNewSetting(containerEl);
		// 		});
		// });

		// // Button to remove the last settings entry
		// new Setting(containerEl)
		// 	.addButton(button => {
		// 		button
		// 			.setButtonText("Remove Last Setting")
		// 			.setWarning() // Optional: makes the button red for warning
		// 			.onClick(() => {
		// 				this.removeLastSetting();
		// 			});
		// 	});
			



	// registerUserCommand() { //OLD THIS DOESNT WORK IN EDITOR MODE
	// 	if (!this.settings.userCommandCode) {
	// 		new Notice('No code provided for the custom command.');
	// 		return;
	// 	}

	// 	try {
	// 		// // OLD VERSION (this was editor dependent)
	// 		// const userCode = this.settings.userCommandCode;
	// 		// const userFunction = new Function('editor', 'view', userCode);
	// 		// NEW VERSION (tthis is meant to not be editor dependent)
	// 		const userFunction = new Function(this.settings.userCommandCode);


	// 		// // OLD VERSION (this was editor dependent)
	// 		// this.addCommand({
	// 		// 	id: 'user-custom-command',
	// 		// 	name: 'User Custom Command',
	// 		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
	// 		// 		userFunction(editor, view);
	// 		// 	}
	// 		// });
			
			
	// 		// TODO UNCOMMENT THIS!
	// 		// NEW VERSION (tthis is meant to not be editor dependent)
	// 		this.addCommand({
	// 			id: 'user-custom-command',
	// 			name: 'User Custom Command',
	// 			// callback: () => { new SampleModal(this.app).open(); } //BUG, I tried using this and this function is not bing used.
	// 			callback: () => {
	// 				// This is where you execute the user's code
	// 				const userFunction = new Function(this.settings.userCommandCode);
	// 				try {
	// 					userFunction(); // Run the user's code
	// 				} catch (error) {
	// 					new Notice('Error in your code: ' + error.message);
	// 				}
	// 			}
	// 		});

	// 		new Notice('Custom command registered successfully.');
	// 	} catch (error) {
	// 		new Notice('Error in your code: ' + error.message);
	// 	}
	// }




			// // Load and display the existing dynamic settings from the plugin's saved settings
		// this.plugin.settings.dynamicSettings.forEach(settingValue => {
		// 	this.addNewSetting(containerEl, settingValue);
		// });




	// OLD (OLDER STILL)
	// // Function to add a new setting entry
	// addNewSetting(containerEl: HTMLElement): void {
	// 	new Setting(containerEl)
	// 		.setName('Setting #1')
	// 		.setDesc('It\'s a secret')
	// 		.addText(text => text
	// 			.setPlaceholder('Enter your secret')
	// 			.setValue(this.plugin.settings.mySetting)
	// 			.onChange(async (value) => {
	// 				this.plugin.settings.mySetting = value;
	// 				await this.plugin.saveSettings();
	// 			})
	// 		)
	// 	;
	// }


	// OLD
	// // Function to add a new setting entry
	// addNewSetting(containerEl: HTMLElement): void {
	// 	const setting = new Setting(containerEl)
	// 		.setName(`Setting #${this.settingsArray.length + 1}`)
	// 		.setDesc('It\'s a secret')
	// 		.addText(text => text
	// 			.setPlaceholder('Enter your secret')
	// 			.setValue(this.plugin.settings.mySetting)
	// 			.onChange(async (value) => {
	// 				this.plugin.settings.mySetting = value;
	// 				await this.plugin.saveSettings();
	// 			})
	// 		);

	// 	// Add the new setting to the array for tracking
	// 	this.settingsArray.push(setting);
	// }


	// OLD
	// Function to remove the last setting entry
	removeLastSetting(): void {
		if (this.settingsArray.length > 0) {
			// Remove the last setting from the DOM
			const lastSetting = this.settingsArray.pop();
			lastSetting.settingEl.remove();
		}
	}







		////////////////////////

		// // // Initial setting entry #UNDO
		// this.addNewSetting(containerEl);
		// this.removeLastSetting(containerEl);
			
		// NEW 	
		// Load and display the existing dynamic settings from the plugin's saved settings
		// this.plugin.settings.dynamicSettings.forEach(settingValue => {
		// 	this.addNewSetting(containerEl, settingValue);
		// });
		// this.removeLastSetting(containerEl);

		// // Load and display the existing dynamic settings from the plugin's saved settings
		// if (this.settingsArray.length === 0) { // Ensure settings are only loaded once
		// 	this.plugin.settings.dynamicSettings.forEach(settingValue => {
		// 		this.addNewSetting(containerEl, settingValue);
		// 	});
		// }






	// // NEW 
	// // Function to add a new setting entry
	// addNewSetting(containerEl: HTMLElement, initialValue: string = ''): void {
	// 	const setting = new Setting(containerEl)
	// 		.setName(`Setting #${this.settingsArray.length + 1}`)
	// 		.setDesc('It\'s a secret')
	// 		.addText(text => text
	// 			.setPlaceholder('Enter your secret')
	// 			.setValue(initialValue)
	// 			.onChange(async (value) => {
	// 				this.plugin.settings.dynamicSettings[this.settingsArray.length - 1] = value; // Update the saved value
	// 				await this.plugin.saveSettings();
	// 			})
	// 		);



	// blah
	// 	// Add the new setting to the array for tracking
	// 	this.settingsArray.push(setting);
	// 	this.plugin.settings.dynamicSettings.push(initialValue); // Save the initial value in plugin settings
	// 	this.plugin.saveSettings();
	// }
	// // Function to remove the last setting entry
	// removeLastSetting(): void {
	// 	if (this.settingsArray.length > 0) {
	// 		// Remove the last setting from the DOM
	// 		const lastSetting = this.settingsArray.pop();
	// 		lastSetting.settingEl.remove();

	// 		// Remove the setting from the plugin settings and save
	// 		this.plugin.settings.dynamicSettings.pop();
	// 		this.plugin.saveSettings();
	// 	}
	// }




	// I tried to runt this pati nso a single unfciotn
	const setting = new Setting(containerEl)
                .setName(`Quote #${index + 1}`)
                .setDesc('Enter your favorite quote')
                .addText(text => text
                    .setPlaceholder('Enter your quote')
                    .setValue(quote)
                    .onChange(async (value) => {
                        this.plugin.settings.quotes[index] = value;
                        await this.plugin.saveSettings();
                    })
                )
                .addButton(button => button
                    .setButtonText('Remove')
                    .setCta() // Optional, makes the button more prominent
                    .onClick(async () => {
                        // Remove the quote from the array and save the settings
                        this.plugin.settings.quotes.splice(index, 1);
                        await this.plugin.saveSettings();
                        // Re-render the settings UI
                        this.display();
                    })
                );




*/
